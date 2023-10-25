package com.myapps.flightdash;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.EnableAspectJAutoProxy;

@SpringBootApplication
@EnableAspectJAutoProxy
public class FlightDashApplication {

	public static void main(String[] args) {
		SpringApplication.run(FlightDashApplication.class, args);
	}

}
