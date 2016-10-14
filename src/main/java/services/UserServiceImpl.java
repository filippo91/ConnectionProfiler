package services;

import static org.junit.Assert.assertNotNull;

import java.util.Date;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import exceptions.TokenNotValidException;
import listeners.OnRegistrationCompleteEvent;
import models.User;
import models.VerificationToken;
import repositories.UserRepository;

@Service
public class UserServiceImpl implements UserService {
	private static final Logger log = LoggerFactory.getLogger(UserServiceImpl.class);
	
	private static final String APP_URL = "http://localhost:8080/connectionProfiler/index.html#!/confirmRegistration";
	
	@Autowired private UserRepository userRepository;
	@Autowired private TokenService tokenService;
	@Autowired private ApplicationEventPublisher eventPublisher;
	
	@Override
	public void register(User user, Date registrationDate) {
		log.info("Try to register a new user with the following information: " + user);
		
		/*
		 * Fill the spring related fields for a user object and 
		 * save it in the repository.
		 */
		user.setPassword(getEncrypted(user.getPassword()));
		user.setEnabled(false);
        user.setAccountNonExpired(true);
        user.setAccountNonLocked(true);
        user.setCredentialsNonExpired(true);
        user.setRole("ROLE_USER");
        user.setId(createUserId(user));
		userRepository.save(user);
		
		// create and save a verification token for this user
		String token = tokenService.createToken(user, registrationDate);
		
		/* set up an event that causes the system to send an email
		 * to the user in order to verify his account through the 
		 * verification token just created.
		 */		
		eventPublisher.publishEvent(new OnRegistrationCompleteEvent(user, APP_URL, token));
	}

	private String getEncrypted(String password) {
		BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
		String encryptedPassword = encoder.encode(password);
		return encryptedPassword;
	}

	private Integer createUserId(User user) {
		Integer id = null;
		User foundUser = user;
		
		assertNotNull(foundUser);
		
		int collisionsCounter = 0;
		while(foundUser != null){
			id = user.hashCode() + collisionsCounter;
			foundUser = userRepository.findById(id);
			collisionsCounter++;
		}
		
		assertNotNull(id);
		
		return id;
	}

	@Override
	public void confirmRegistration(String token, Date confirmationDate) {
		VerificationToken verificationToken = tokenService.findByToken(token);
		
		if(!tokenService.isValid(token, confirmationDate)){
			throw new TokenNotValidException();
		}
		
		/*
		 * The user has presented a correct token: we can set his
		 * status to enabled
		 */
		User user = verificationToken.getUser();
		user.setEnabled(true);
		userRepository.save(user);
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
