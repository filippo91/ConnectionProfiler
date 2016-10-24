package services;

import java.util.Date;

import models.User;
import models.VerificationToken;

public interface TokenService {
	public static final int VERIFICATION_TOKEN_DURATION = 60 * 24; //in minutes 
	
	public VerificationToken findByToken(String token);
	boolean isValid(String token, Date date);
	public void save(VerificationToken verificationToken);
	public User getUser(String token);

}
