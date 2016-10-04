package listeners;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

import models.User;
import services.UserService;

@Component
public class RegistrationListener implements ApplicationListener<OnRegistrationCompleteEvent> {
	Logger log = LoggerFactory.getLogger(RegistrationListener.class);
	
	private final static String EMAIL_SUBJECT = "Confirm your email address";
	private final static String EMAIL_FROM = "phil@pippo.com";
	
	@Autowired JavaMailSender mailSender;
	
	@Autowired UserService userService;
	
	@Override
	public void onApplicationEvent(OnRegistrationCompleteEvent event) {
		this.requestConfirmation(event);
	}

	private void requestConfirmation(OnRegistrationCompleteEvent event) {
		User user = event.getUser();
		String url = event.getAppUrl() + "confirmRegistration";
		String token = event.getToken();
		String recipientAddress = user.getEmail();
		
		SimpleMailMessage email = new SimpleMailMessage();
		email.setTo(recipientAddress);
		email.setSubject(EMAIL_SUBJECT);
		email.setText(url + " " + token);
		email.setFrom(EMAIL_FROM);
		mailSender.send(email);
	}

}