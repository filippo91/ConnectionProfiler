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
import listeners.OnEmailVerifiedEvent;
import listeners.OnRegistrationCompleteEvent;
import models.User;
import models.VerificationToken;
import repositories.UserRepository;

@Service
public class UserServiceImpl implements UserService {
	private static final Logger log = LoggerFactory.getLogger(UserServiceImpl.class);
	
	@Autowired private UserRepository userRepository;
	@Autowired private ApplicationEventPublisher eventPublisher;

	@Autowired private TokenService tokenService;
	
	@Transactional
	@Override
	public void register(User user, VerificationToken verificationToken) {
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

		eventPublisher.publishEvent(new OnRegistrationCompleteEvent(user));
	}

	private String getEncrypted(String password) {
		BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
		System.out.println(password);
		String encryptedPassword = encoder.encode(password);
		return encryptedPassword;
	}
	
	@Override
	public void confirmRegistration(String token, Date confirmationDate) {
		log.info("try to confirm registration for token: " + token);
		
		if(!tokenService.isValid(token, confirmationDate)){
			throw new TokenNotValidException();
		}
		
		/*
		 * The user has presented a correct token: we can set his
		 * status to enabled
		 */
		User user = tokenService.getUser(token);
		user.setEnabled(true);
		userRepository.save(user);
		log.info("enable user: " + user);
		 
		eventPublisher.publishEvent(new OnEmailVerifiedEvent(user));
	}
}
