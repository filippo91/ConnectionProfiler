package services;

import java.util.UUID;

import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import listeners.OnRegistrationCompleteEvent;
import models.User;
import models.VerificationToken;
import repositories.UserRepository;
import repositories.VerificationTokenRepository;

@Service
public class SimpleUserService implements UserService {
	private static final Logger log = LoggerFactory.getLogger(SimpleUserService.class);
	
	@Autowired UserRepository userRepository;
	@Autowired VerificationTokenRepository tokenRepository;
	@Autowired ApplicationEventPublisher eventPublisher;
	
	@Override
	public void register(User user) {
		log.info("Try to register a new user with the following information: " + user);
		
		/*
		 * Fill the spring related fields for a user object and 
		 * save it in the repository.
		 */
		BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
		String password = encoder.encode(user.getPassword());
		user.setPassword(password);
		user.setEnabled(false);
        user.setAccountNonExpired(true);
        user.setAccountNonLocked(true);
        user.setCredentialsNonExpired(true);
        
		userRepository.save(user);
		
		// create and save a verification token for this user
		String token = UUID.randomUUID().toString();
		createAndPersistVerificationToken(user, token);
		
		/* set up an event that causes the system to send an email
		 * to the user in order to verify his account through the 
		 * verification token just created.
		 */
		String appUrl = "http://localhost:8080/connectionProfiler/";
		
		eventPublisher.publishEvent(new OnRegistrationCompleteEvent(user, appUrl, token));
	}

	@Override
	public void confirmRegistration(String token) {
		VerificationToken verificatioToken = tokenRepository.findByToken(token);
		
		if(verificatioToken == null){
			//the token doesn't exist: bad user
			//TODO: throw exception
		}
		
		DateTime now = DateTime.now();
		
		if(now.isAfter(verificatioToken.getExpiryDate().getTime())){
			//the token has already expired: bad user
			//TODO: throw exception
		}
		
		/*
		 * The user has presented a correct token: we can set his
		 * status to enabled
		 */
		User user = verificatioToken.getUser();
		user.setEnabled(true);
	}

    private void createAndPersistVerificationToken(User user, String token) {
        VerificationToken myToken = new VerificationToken(token, user);
        tokenRepository.save(myToken);
    }
}
