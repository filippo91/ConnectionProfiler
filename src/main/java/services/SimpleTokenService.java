package services;

import java.util.Date;
import java.util.UUID;

import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import models.User;
import models.VerificationToken;
import repositories.VerificationTokenRepository;

@Service
public class SimpleTokenService implements TokenService {
	@Autowired private VerificationTokenRepository tokenRepository;
	
	@Override
	public VerificationToken findByToken(String token) {
		return tokenRepository.findByToken(token);
	}

	@Override
	public String createToken(User user, Date creationDate) {
		String token = UUID.randomUUID().toString();
		DateTime expirationDate = new DateTime(creationDate);
		expirationDate = expirationDate.plus(VERIFICATION_TOKEN_DURATION);
		VerificationToken myToken = new VerificationToken(token, user, creationDate, expirationDate.toDate());
        tokenRepository.save(myToken);
        return myToken.getToken();
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
}
