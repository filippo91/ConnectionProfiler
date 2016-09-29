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
		
		BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
		String password = encoder.encode(user.getPassword());
		user.setPassword(password);
		user.setEnabled(true);
        user.setAccountNonExpired(true);
        user.setAccountNonLocked(true);
        user.setCredentialsNonExpired(true);
        
		userRepository.save(user);
		
		String appUrl = "http://localhost:8080/connectionProfiler/";
		String token = UUID.randomUUID().toString();
		createVerificationToken(user, token);
		
		eventPublisher.publishEvent(new OnRegistrationCompleteEvent(user, appUrl, token));
	}


	
	@Override
    public void createVerificationToken(User user, String token) {
        VerificationToken myToken = new VerificationToken(token, user);
        tokenRepository.save(myToken);
    }



	@Override
	public void confirmRegistration(String token) {
		// TODO Auto-generated method stub
		VerificationToken verificatioToken = tokenRepository.findByToken(token);
		if(verificatioToken == null){
			//TODO: throw exception
		}
		
		DateTime now = DateTime.now();
		
		if(now.isAfter(verificatioToken.getExpiryDate().getTime())){
			//TODO: throw exception
		}
		
		User user = verificatioToken.getUser();
		user.setEnabled(true);
	}

}
