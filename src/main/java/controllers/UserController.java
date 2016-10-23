package controllers;

import java.security.InvalidParameterException;
import java.security.Principal;
import java.util.Date;

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

import models.User;
import models.VerificationToken;
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

	@PostMapping("/public/user")
	@ResponseStatus(value = HttpStatus.CREATED)
	public void register(@RequestBody @Valid User user, BindingResult bindingResult, VerificationToken verificatioToken) {
		if (bindingResult.hasErrors()) {
			log.error("Binding Result contains errors");
			throw new InvalidParameterException();
		}
		userService.register(user, verificatioToken);
		
		log.info("User successfully registered.");
		log.info("New user details: " + user);
	}

	@PostMapping(value = "/public/user/confirm")
	public void confirmRegistration(@RequestBody String token) {
		log.info("confirm account with token: " + token);
		userService.confirmRegistration(token, new Date());
	}

	@ResponseStatus(value = HttpStatus.BAD_REQUEST, reason = "TODO") // 409
	@ExceptionHandler(InvalidParameterException.class)
	public void badInputForNewUser() {
		log.info("InvalidParameterException");
	}
	
	@ResponseStatus(value = HttpStatus.BAD_REQUEST, reason = "TODO") // 409
	@ExceptionHandler(DataIntegrityViolationException.class)
	public void duplicateInformationForNewUser(DataIntegrityViolationException dive) {
		log.info("Impossible to save the user into the DB");
		System.out.println(dive);
	}
	
}
