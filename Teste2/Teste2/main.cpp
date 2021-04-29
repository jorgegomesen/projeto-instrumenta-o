/*
* Teste2.cpp
*
* Created: 28/04/2021 22:12:18
* Author : conta
*/

#define F_CPU 16000000UL
#include <avr/io.h>
#include <avr/interrupt.h>
#include <util/delay.h>
#include <stdio.h>
#include <stdlib.h>

#define TRIGGER_PIN PIND3
#define ECHO_PIN PIND2

volatile unsigned short contador;

void iniciarPortas() {
	DDRD |= (1 << TRIGGER_PIN); // Configura PIND3 como saída e o restante como entrada
	PORTD = 0b00000000; // Set all pins of PORTD low which turns it off.
	
	EIMSK |= (1 << INT0); // Ativação da interrupção externa
	EICRA |= (1 << ISC00); // Geração de interrupção pela mudança em INT0

	//Ativando Timer 1 com prescaller de 64
	TCCR1B = (0 << CS12) | (1 << CS11) | (1 << CS10);
}

void iniciarSerial(){
	UBRR0H = 0x00;
	UBRR0L = 0x67;
	UCSR0A = 0x40;
	UCSR0B = 0x18;
	UCSR0C = 0x06;
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

unsigned char medirDistancia( void ){
	contador = 0;
	
	PORTD |=  (1 << TRIGGER_PIN);
	
	_delay_us( 10 );
	
	PORTD &= ~(1 << TRIGGER_PIN);

	while(contador == 0);
	
	if (contador < 3700) {
		return 0.000004 * contador/2 * 34300;
	} else {
		return 41;
	}
	
}

int main(void){
	unsigned char distancia;
	
	iniciarSerial();
	iniciarPortas();
	
	sei();
	
	while (1){
		distancia = medirDistancia();
		
		char distancia_str[17];
		sprintf(distancia_str, "Distancia = %d cm", distancia);
		
		enviarTextoSerial(distancia_str);
		
		_delay_ms(200);
	}
}