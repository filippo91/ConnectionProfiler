package services;

import java.util.Date;

import models.User;
import models.VerificationToken;

public interface UserService {
	void confirmRegistration(String token, Date confirmationDate);
	void register(User user, VerificationToken verificationToken);
}
