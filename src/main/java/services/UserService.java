package services;

import models.User;

public interface UserService {
	void register(User user);
	void createVerificationToken(User user, String token);
	
	void confirmRegistration(String token);
}
