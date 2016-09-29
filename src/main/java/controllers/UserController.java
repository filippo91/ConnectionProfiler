package controllers;

import java.security.Principal;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.validation.BindingResult;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.mongodb.MongoException;

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
	@ResponseStatus(value=HttpStatus.CREATED)
	public void register(@RequestBody @Validated User user, BindingResult bindingResult) {
		if(bindingResult.hasErrors()){
			log.error("Binding Result contains errors.");
		}
		
		userService.register(user);
		
		log.info("User successfully registered.");
		log.info("New user details: " + user);
	}
	
	  // Convert a predefined exception to an HTTP Status code
	  @ResponseStatus(value=HttpStatus.CONFLICT,
	                  reason="Data integrity violation")  // 409
	  @ExceptionHandler(MongoException.class)
	  public void conflict() {
	    // Nothing to do
	  }
	  
	  @PostMapping(value = "/registrationConfirm")
	  public void confirmRegistration(@RequestBody String token){
		  userService.confirmRegistration(token);
	  }
}
