package services;

import java.util.Date;

import models.Subscription;
import models.User;
import models.VerificationToken;

public interface UserService {
	//void register(User user, Date registrationDate);
	void confirmRegistration(String token, Date confirmationDate);
	void addSubscription(User user, Subscription subscription);
	void register(User user, VerificationToken verificationToken);
}
