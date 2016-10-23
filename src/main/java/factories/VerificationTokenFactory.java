package factories;

import java.util.UUID;

import org.joda.time.DateTime;
import org.springframework.beans.factory.config.AbstractFactoryBean;

import models.VerificationToken;

public class VerificationTokenFactory extends AbstractFactoryBean<Object> {
	public static final int VERIFICATION_TOKEN_DURATION = 60 * 24; //in minutes 
	
	@Override
	protected Object createInstance() throws Exception {
		VerificationToken verificationToken = new VerificationToken();
		
		String token = UUID.randomUUID().toString();
		verificationToken.setToken(token);
		
		DateTime creationDate = new DateTime();
		verificationToken.setCreationDate(creationDate.toDate());
		
		DateTime expirationDate = new DateTime(creationDate);
		expirationDate = expirationDate.plus(VERIFICATION_TOKEN_DURATION);
		verificationToken.setExpirationDate(expirationDate.toDate());
		
		return verificationToken;
	}

	@Override
	public Class<?> getObjectType() {
		return VerificationToken.class;
	}

}
