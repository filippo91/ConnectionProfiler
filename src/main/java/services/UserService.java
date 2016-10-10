package services;

import java.util.Date;

import models.User;

public interface UserService {
	User getCurrentUser();
	void register(User user, Date registrationDate);
	void confirmRegistration(String token, Date confirmationDate);
}
