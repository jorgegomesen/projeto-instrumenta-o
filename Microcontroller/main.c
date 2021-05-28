#define F_CPU 16000000UL
#include <avr/io.h>
#include <avr/interrupt.h>
#include <util/delay.h>
#include <stdio.h>
#include <stdlib.h>

#define TRIGGER_PIN PIND3
#define ECHO_PIN PIND2
#define GREEN_LED_PIN PINB0
#define RED_LED_PIN PINB4
#define BUTTON_PIN PINC0
#define MAX_VOLUME 5

volatile unsigned short contador;

void iniciarPortas() {
	DDRD |= (1 << TRIGGER_PIN); // Configura PIND3 como saída e o restante como entrada
	PORTD = 0b00000000; // Set all pins of PORTD low which turns it off.

	EIMSK |= (1 << INT0); // Ativação da interrupção externa
	EICRA |= (1 << ISC00); // Geração de interrupção pela mudança em INT0

	//Ativando Timer 1 com prescaller de 64
	TCCR1B = (0 << CS12) | (1 << CS11) | (1 << CS10);

	//Configurando PB0 como saída para estímulo do LED
	DDRB |= (1 << GREEN_LED_PIN) | (1 << RED_LED_PIN);
	PORTB = 0x00; // Inicia LED desligado

	//Configurando PC0 como entrada
	PORTC |= (0 << BUTTON_PIN);
}

void iniciarSerial(){
	UBRR0H = 0x00;
	UBRR0L = 0x67;
	UCSR0A = 0x40;
	UCSR0B = 0x18;
	UCSR0C = 0x06;
}

void iniciarServo(){
	TCCR1A |= (1<<COM1A1) | (1 << COM1B1) | (1 << WGM11); //PWM não invertido
	TCCR1B|=(1<<WGM13)|(1 << WGM12) |(1 << CS11) | (1<<CS10); //PRESCALER=64 Modo 14(FAST PWM)
	ICR1=4999;  //fPWM=50Hz
	DDRB |= (1 << PB0) | (1 << PB1);   //PWM Pinos como saída
}

void setarPosicaoServo(unsigned int grau){
	//	1.5 ms para posição 0
	//	2ms para posição 90
	//	Considerando um prescaler de 64, temos que a frequência do timer1 será de 250KHz
	//  o que nos dá um período de 4us
	//	Para posição 0 temos (1.5ms / 4us) = 375
	//  Para posição 1 temos (2ms / 4us * 90) = 5.5556
	if(!grau){
		//		OCR1A = 375;
		OCR1A = 200;
		return;
	}

	OCR1A = (unsigned int) (5.5556 * grau);
}

ISR( INT0_vect ){

	if(PIND & (1 << ECHO_PIN)) {
		TCNT1 = 0;
	} else  {
		contador = TCNT1;
	}

}

void enviarCaracterSerial(char caracter){
	while((UCSR0A & 0x20) != 0x20){}
	UDR0 = caracter;

	while((UCSR0A & 0x40) != 0x40){}
	UCSR0A = 0x40;
}

void enviarTextoSerial(char *texto){
	while(*texto > 0){
		enviarCaracterSerial(*texto++);
	}
	enviarCaracterSerial('\n');
}

long medirDistancia( void ){
	contador = 0;

	PORTD |=  (1 << TRIGGER_PIN);

	_delay_us( 10 );

	PORTD &= ~(1 << TRIGGER_PIN);

	while(contador == 0);

	/*
	 * Se distância = 400 cm então, contador = 5830.9
	 * Se distância = 2 cm então, contador = 29.15
	 */

	return (double) ((0.000004 * contador * 34300) / 2);

}

int main(void){
	long distancia;
	char servo_posicionado = 0;
	char distancia_str[5];
	// o frasco de álcool em gel comporta apenas 500ml
	int max_volume = MAX_VOLUME;
	char is_red_led_on = 0;
	char status_recarga_transmitido = 0;

	iniciarSerial();
	iniciarPortas();
	iniciarServo();

	//	habilita interrupções externas
	sei();

	while (1){
		if(PINC & (1 << BUTTON_PIN) && is_red_led_on){
			PORTB &= (0 << RED_LED_PIN);
			max_volume = MAX_VOLUME;
			is_red_led_on = 0;

			if(status_recarga_transmitido){
				//Status = recharged
				sprintf(distancia_str, "%s", "REC");
				enviarTextoSerial(distancia_str);

				status_recarga_transmitido = 0;
			}

			continue;
		}

		if(max_volume < 2){
			PORTB |= (1 << RED_LED_PIN);
			is_red_led_on = 1;

			if(!status_recarga_transmitido){
				//Status = empty
				sprintf(distancia_str, "%s", "EMP");
				enviarTextoSerial(distancia_str);
				status_recarga_transmitido = 1;
			}

			continue;
		}

		status_recarga_transmitido = 0;

		//Tempo entre a leitura de dados
		_delay_ms(500);

		distancia = medirDistancia();

		if(distancia < 10){
			//			sprintf(distancia_str, "%ld", distancia);
			//Status = dispenser
			sprintf(distancia_str, "%s", "DIS");
			enviarTextoSerial(distancia_str);

			//			if(!servo_posicionado){
			//Acende LED
			PORTB |= (1 << GREEN_LED_PIN);

			setarPosicaoServo(80);
			_delay_ms(500);
			setarPosicaoServo(0);
			_delay_ms(500);
			setarPosicaoServo(80);

			//				servo_posicionado = 1;

			//Tempo em milisegundos que o LED ficará ligado e o servo estará posicionado
			_delay_ms(500);

			//Desliga LED
			PORTB &= ~(1 << GREEN_LED_PIN);

			setarPosicaoServo(0);

			//Tempo de reação do usuário para retirar a mão de próximo do sensor
			_delay_ms(3000);
			//			}

			//Cada jorrada dispensa 2ml
			max_volume -= 2;

			continue;
		}

		setarPosicaoServo(0);
		//		servo_posicionado = 0;
	}
}
