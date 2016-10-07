package controllers;

import java.security.InvalidParameterException;
import java.security.Principal;

import javax.validation.Valid;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

//import listeners.OnRegistrationCompleteEvent;
import models.User;
import services.UserService;

@CrossOrigin
@RestController
public class UserController {
	private static final Logger log = LoggerFactory.getLogger(UserController.class);

	@Autowired UserService userService;

	@GetMapping("/user")
	public Principal user(Principal user) {
		return user;
	}

	@PostMapping("/newUser")
	//@ResponseStatus(value = HttpStatus.CREATED)
	public void register(@RequestBody @Valid User user, BindingResult bindingResult) {
		if (bindingResult.hasErrors()) {
			log.error("Binding Result contains errors");
			throw new InvalidParameterException();
		}

		try{
			userService.register(user);
		}catch(DataIntegrityViolationException ex){
			log.info("Impossible to save the user into the DB");
			throw ex;
		}
		
		log.info("User successfully registered.");
		log.info("New user details: " + user);
	}

	@PostMapping(value = "/newUser/confirmRegistration")
	public void confirmRegistration(@RequestBody String token) {
		userService.confirmRegistration(token);
	}

	@ResponseStatus(value = HttpStatus.BAD_REQUEST, reason = "TODO") // 409
	@ExceptionHandler(InvalidParameterException.class)
	public void badInputForNewUser() {
		// Nothing to do
	}
	
	@ResponseStatus(value = HttpStatus.BAD_REQUEST, reason = "TODO") // 409
	@ExceptionHandler(DataIntegrityViolationException.class)
	public void duplicateInformationForNewUser() {
		// Nothing to do
	}
	
}
