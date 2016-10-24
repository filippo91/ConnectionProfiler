package services;

import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import models.User;
import models.VerificationToken;
import repositories.VerificationTokenRepository;

@Service
public class TokenServiceImpl implements TokenService {
	@Autowired private VerificationTokenRepository tokenRepository;
	
	@Override
	public VerificationToken findByToken(String token) {
		return tokenRepository.findByToken(token);
	}
	
	@Override
	public boolean isValid(String token, Date date) {
		boolean valid = false;
	
		VerificationToken verificationToken = tokenRepository.findByToken(token);
		
		if(verificationToken != null){
			if(!verificationToken.isExpired(date)){
				valid = true;
			}
		}
		
		return valid;
	}

	@Override
	public void save(VerificationToken verificationToken) {
		tokenRepository.save(verificationToken);
	}

	@Override
	public User getUser(String token) {
		VerificationToken verificationToken = tokenRepository.findByToken(token);
		User user = null;
		
		if(verificationToken != null){
			user = verificationToken.getUser();
		}
		
		return user;
	}
}
