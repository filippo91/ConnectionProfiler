package services;

import java.util.Date;

import models.User;
import models.VerificationToken;

public interface TokenService {
	public static final int VERIFICATION_TOKEN_DURATION = 60 * 24; //in minutes 
	
	public VerificationToken findByToken(String token);
	public String createToken(User user, Date creationDate);
	boolean isValid(String token, Date date);

}
