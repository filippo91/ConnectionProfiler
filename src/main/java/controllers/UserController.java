package controllers;

import java.security.Principal;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin
@RestController
public class UserController {

	@RequestMapping("/user")
	public Principal user(Principal user) {
		System.out.println(user.getName());
		return user;
	}

}
