package services;

import java.util.Date;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.annotation.Bean;
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
	
	@Autowired private UserRepository userRepository;
	@Autowired private TokenService tokenService;
	@Autowired private ApplicationEventPublisher eventPublisher;
	
	@Autowired private SubscriptionService subscriptionService;
	
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
		
		/* set up an event that causes the system to send an email
		 * to the user in order to verify his account through the 
		 * verification token just created.
		 */		
		verificationToken.setUser(user);
		log.info(verificationToken.toString());
		tokenService.save(verificationToken);

		eventPublisher.publishEvent(new OnRegistrationCompleteEvent(verificationToken));
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
		VerificationToken verificationToken = tokenService.findByToken(token);
		
		if(verificationToken != null){
			log.info("got verification token: " + verificationToken.toString());
		}else{
			log.info("token not found");
			throw new TokenNotValidException();
		}
		
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
		log.info("enable user: " + user);
		//create a corresponding 
		subscriptionService.create(user.getUid());
	}
}
