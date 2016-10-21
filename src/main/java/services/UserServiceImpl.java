package services;

import java.util.Date;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import exceptions.TokenNotValidException;
import exceptions.UsernameAlreadyExistException;
import listeners.OnRegistrationCompleteEvent;
import models.User;
import models.VerificationToken;
import repositories.UserRepository;

@Service
public class UserServiceImpl implements UserService {
	private static final Logger log = LoggerFactory.getLogger(UserServiceImpl.class);
	
	private static final String APP_URL = "http://localhost:8080/connectionProfiler";
	
	@Autowired private UserRepository userRepository;
	@Autowired private TokenService tokenService;
	@Autowired private ApplicationEventPublisher eventPublisher;
	
	@Transactional
	@Override
	public void register(User user, Date registrationDate) {
		log.info("Try to register a new user with the following information: " + user);
		
		User userDB = userRepository.findByUsername(user.getUsername());
		if(userDB != null){
			throw new UsernameAlreadyExistException();
		}

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
}
