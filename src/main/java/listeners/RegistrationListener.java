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
		
		SimpleMailMessage email = new SimpleMailMessage();
		String recipientAddress = user.getEmail();
		email.setTo(recipientAddress);
		String subject = "Confirm your email address";
		email.setSubject(subject);

		email.setText(url + " " + token);
		email.setFrom("phil@pippo.com");
		mailSender.send(email);
	}

}