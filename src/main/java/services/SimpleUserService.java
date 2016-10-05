package services;

import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.core.context.SecurityContextHolder;
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
	
	private static final int VERIFICATION_TOKEN_EXPIRATION = 60 * 24; //in minutes
	
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
        user.setRole("ROLE_USER");
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
		System.out.println("fisajflkadjflasfskldjfklsjdfklasjfkljklsdfjlaksfjlskdjfkl");
		VerificationToken verificationToken = tokenRepository.findByToken(token);
		
		//VerificationToken verificatioToken = verificatioTokenList.get(0);
		System.out.println(verificationToken);
		if(verificationToken == null){
			//the token doesn't exist: bad user
			//TODO: throw meaningful exception
			throw new Error("Bad user");
		}
		
		if(verificationToken.isExpired()){
			//the token has already expired: bad user
			//TODO: throw meaningful exception
			throw new Error("Bad user");
		}
		
		/*
		 * The user has presented a correct token: we can set his
		 * status to enabled
		 */
		User user = verificationToken.getUser();
		user.setEnabled(true);
		userRepository.save(user);
	}

    private void createAndPersistVerificationToken(User user, String token) {
        VerificationToken myToken = new VerificationToken(token, user, VERIFICATION_TOKEN_EXPIRATION);
        tokenRepository.save(myToken);
    }

	@Override
	public User getCurrentUser() {
		/* 
		 * leverage spring security mechanism to get the current
		 * user from the security context.
		 */
		String username = SecurityContextHolder.getContext().getAuthentication().getName();
		User user = userRepository.findByUsername(username);
		return user;
	}
}
