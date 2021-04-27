/*
 * main.c
 *
 *  Created on: Apr 6, 2021
 *      Author: jorgec
 */
#include <stdlib.h>
#include <avr/io.h>
#include <util/delay.h>
#include <avr/interrupt.h>

#define F_CPU 16000000UL

unsigned int pulse = 0; // interger  to access all though the program
unsigned int i = 0; // interger  to access all though the program

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

//interrupt service routine when there is a change in logic level
ISR(INT0_vect){
	//when logic from HIGH to LOW

	//	enviarDadoSerial('I');
	//	enviarDadoSerial('\n');
	char distance[5];
	char place[] = "Interrupcao";

	itoa(TCNT1, distance, 10);

	sendString(distance);
	sendString(place);

	if (i == 1){
		TCCR1B = 0; //desabilitando o contador
		pulse = TCNT1; //count memory is updated to integer
		TCNT1 = 0; //resetando o contador
		i = 0;
	}

	//when logic change from LOW to HIGH
	if (i == 0){
		TCCR1B |= (1 << CS10); //habilitando contador sem prescaller
		i = 1;
	}

}

void sendString(char *string_of_characters){

	while(*string_of_characters > 0){
		enviarDadoSerial(*string_of_characters++);
	}

	enviarDadoSerial('\n');
}

int main(void){
	char SHOWA [5];

	iniciarSerial();
	//	iniciarSensorUltrassonico();

	DDRB = 0xFF; //putting portB output pins

	DDRD = 0b11111011;

	EICRA = (1 << ISC00); //qualquer mudança lógica em INT0 gera uma interrupção externa
	EIMSK = (1 << INT0); //habilitando interrupção n

	int16_t COUNTA = 0; //armazenando saída digital

	sei(); //	habilitando interrupções externas

	while(1){
		_delay_ms(1000); 	// To allow sufficient time between queries (60ms min)

		PORTD |= (1 << PIND0);

		_delay_ms(15); // pulso de 15us

		PORTD &= ~(1 << PIND0);

		COUNTA = pulse/58; //getting the distance based on formula on introduction

		//		itoa(COUNTA, SHOWA, 10);
		//
		//		sendString(SHOWA);


//		char str[] = "teste";
//
//		sendString(str);

	}

}
