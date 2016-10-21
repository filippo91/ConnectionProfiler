package services;

import java.util.Date;

import models.User;

public interface UserService {
	void register(User user, Date registrationDate);
	void confirmRegistration(String token, Date confirmationDate);
}
