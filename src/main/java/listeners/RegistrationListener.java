package listeners;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

import models.User;
import services.UserService;

@Component
public class RegistrationListener implements ApplicationListener<OnRegistrationCompleteEvent> {
	Logger log = LoggerFactory.getLogger(RegistrationListener.class);
	
	private final static String EMAIL_SUBJECT = "Confirm your email address";
	private final static String EMAIL_FROM = "aiProjectTeam@polito.it";
	
	@Autowired JavaMailSender mailSender;
	
	@Autowired UserService userService;
	
	@Override
	public void onApplicationEvent(OnRegistrationCompleteEvent event) {
		this.requestConfirmation(event);
	}

	private void requestConfirmation(OnRegistrationCompleteEvent event) {
		User user = event.getUser();
		String url = event.getAppUrl() + "newUser/confirmRegistration";
		String token = event.getToken();
		String recipientAddress = user.getEmail();
		
		SimpleMailMessage email = new SimpleMailMessage();
		email.setTo(recipientAddress);
		email.setSubject(EMAIL_SUBJECT);
		email.setText("Dear " + user.getUsername() + ", "
                + "thank you for registering into our service."
				+ "In order to complete the registration process click"
				+ "on the following link: " 
                + url + " "
                + "and copy and paste the following code: "
                + token
                + "into the designated web page field. "
                + "Enjoy!");
		
		email.setFrom(EMAIL_FROM);
		
		try{
			mailSender.send(email);
		}catch(MailException me){
			//contact the admin
			log.error("Error while sending email to " + user.getUsername());
			me.printStackTrace();
		}
	}

}