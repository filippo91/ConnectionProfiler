package controllers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;

@ControllerAdvice
public class GlobalControllerExceptionHandler {
	private static final Logger log = LoggerFactory.getLogger(GlobalControllerExceptionHandler.class);
	
	@ResponseStatus(value=HttpStatus.BAD_REQUEST, reason="Bad User Input")
	@ExceptionHandler(MethodArgumentNotValidException.class)
	public void handleConflict(){
		log.error("Binding Result contains errors.");
		//nothing to do
	}
	
	@ResponseStatus(value = HttpStatus.BAD_REQUEST, reason = "TODO") // 409
	@ExceptionHandler(IllegalArgumentException.class)
	public void duplicateInformationForNewUser(IllegalArgumentException iae) {
		log.error("duplicateInformationForNewUser.");
		log.error(iae.getMessage());
	}
	
	@ResponseStatus(value = HttpStatus.BAD_REQUEST, reason = "TODO") // 409
	@ExceptionHandler(Exception.class)
	public void general(Exception e) {
		log.error("General catch.");
		log.error(e.getMessage());
	}

}
