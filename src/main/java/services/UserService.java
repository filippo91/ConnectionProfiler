package services;

import models.User;

public interface UserService {
	void register(User user);	
	void confirmRegistration(String token);
	User getCurrentUser();
}
