package listeners;

import java.io.StringWriter;

import org.apache.velocity.VelocityContext;
import org.apache.velocity.app.VelocityEngine;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationListener;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

import models.User;
import models.VerificationToken;
import services.TokenService;

@Component
public class RegistrationListener implements ApplicationListener<OnRegistrationCompleteEvent> {
	private Logger log = LoggerFactory.getLogger(RegistrationListener.class);

	@Value("${confirmation.email.subject}")
	private String EMAIL_SUBJECT;
	@Value("${confirmation.email.from}")
	private String EMAIL_FROM;
	@Value("${confirmation.page}")
	private String CONFIRMATION_PAGE;
	
	@Autowired private JavaMailSender mailSender;
	@Autowired private VelocityEngine velocityEngine;
	
	@Autowired private TokenService tokenService;

	@Override
	public void onApplicationEvent(OnRegistrationCompleteEvent event) {
		this.requestConfirmation(event, new VerificationToken());
	}

	private void requestConfirmation(OnRegistrationCompleteEvent event, VerificationToken verificationToken) {		
		User user = event.getUser();
		
		verificationToken.setUser(user);
		tokenService.save(verificationToken);
		
		String url = event.getAppUrl() + CONFIRMATION_PAGE;
		String token = verificationToken.getToken();
		String recipientAddress = user.getEmail();

		SimpleMailMessage email = new SimpleMailMessage();
		email.setTo(recipientAddress);
		email.setSubject(EMAIL_SUBJECT);
		email.setFrom(EMAIL_FROM);

		VelocityContext velocityContext = new VelocityContext();
		velocityContext.put("name", user.getUsername());
		velocityContext.put("link", url);
		velocityContext.put("token", token);
		StringWriter stringWriter = new StringWriter();
		velocityEngine.mergeTemplate("velocity/confirmRegistrationEmail.html", "UTF-8", velocityContext, stringWriter);
		
		email.setText(stringWriter.toString());

		try {
			mailSender.send(email);
		} catch (MailException me) {
			// contact the admin
			log.error("Error while sending email to " + user.getUsername());
			me.printStackTrace();
		}
	}

	public String getSubject() {
		// TODO Auto-generated method stub
		return EMAIL_SUBJECT;
	}

}