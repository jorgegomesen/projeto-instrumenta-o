/*
* AlcoolDIspenser.c
*
* Created: 27/04/2021 19:31:05
* Author : conta
*/

#include <stdio.h>
#include <stdlib.h>
#include <avr/io.h>
#include <util/delay.h>
#include <avr/interrupt.h>

#define F_CPU 16000000UL

static volatile int contador = 0;
static volatile int sinal_recebido = 0;
volatile unsigned short contador_srh04;

void iniciarSerial(){
	UBRR0H = 0x00;
	UBRR0L = 0x67;
	UCSR0A = 0x40;
	UCSR0B = 0x18;
	UCSR0C = 0x06;
}

void iniciarSensorUltrassonico(){
	//	SETA PB1/PIN9 COMO SAÍDA E PB2/PIN10 COMO ENTRADA
	DDRB = (1 << DDB1) | (0 << DDB2);
	PINB = 0x00;

	//	PORTB = (1<<PB1)|(0<<PB2);
}

void enviarDadoSerial(char data){
	while((UCSR0A & 0x20) != 0x20){}
	UDR0 = data;

	//	_delay_ms(1000);

	while((UCSR0A & 0x40) != 0x40){}
	UCSR0A = 0x40;
}

void sendString(char *string_of_characters){

	while(*string_of_characters > 0){
		enviarDadoSerial(*string_of_characters++);
	}

	enviarDadoSerial('\n');
}

ISR(INT0_vect){
	//char place[] = "Interrupcao";
	//sendString(place);

	char contador_str[15];
	sprintf(contador_str, "Contador = %d", TCNT1);
	sendString(contador_str);

	// borda de descida do echo, ou seja, o sinal refletido foi recebido
	if (sinal_recebido == 1){
		TCCR1B = 0; //desabilitando o contador
		contador = TCNT1; //recuperando número do contador
		TCNT1 = 0; //resetando o contador
		sinal_recebido = 0;
		return;
	}
	
	// borda de subida do echo
	TCCR1B |= (1 << CS10); //habilitando contador sem prescaller
	sinal_recebido = 1;
}

int main(void){
	iniciarSerial();
	//	iniciarSensorUltrassonico();

	DDRD = 0b00010000;
	PORTD = 0b00000000;
	
	EICRA |= (1 << ISC00); //qualquer mudança lógica em INT0 gera uma interrupção externa
	EIMSK |= (1 << INT0); //habilitando pino externo de interrupção INT0

	double distancia = 0; //armazenando saída digital
	char distancia_string [16];

	sei(); //	habilitando interrupções externas

	while(1){
		PORTD |= (1 << PINB4);
		
		_delay_us(15); // pulso de 15us
		
		PORTD &= (1 << PINB4);

		//contador = pulso/58;
		distancia =  (double) 0.0625 * contador / 58.3;
			
		//itoa(contador, distancia_string, 10);
		//
		//sendString(distancia_string);
		
		//char contador_str[15];
		//sprintf(contador_str, "Contador = %d", contador);
		//sendString(contador_str);
		
		char distance_str[17];
		sprintf(distance_str, "Distance = %f", distancia);
		sendString(distance_str);
		
		//itoa(TCNT1, SHOWA, 10);
		//sendString(SHOWA);
	}
	
	//char distance[20];
	//sprintf(distance, "Distance = %f", hc_sr04_meas());
	//sendString(distance);

	return 0;
}


