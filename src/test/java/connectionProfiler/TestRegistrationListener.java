package connectionProfiler;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import listeners.OnRegistrationCompleteEvent;
import listeners.RegistrationListener;
import models.User;

/**
 * Unit testing for the Registration Listener
 * 
 * @author philip
 *
 */
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes=TestRegistrationListenerConfiguration.class)
public class TestRegistrationListener {
	@Autowired private RegistrationListener registrationListener;
	
	private User user;
			
	@Before
	public void setup(){
		user = new User();
		user.setUsername("Pippo");
		user.setEmail("pippo@gmail.com");
	}
	
	@Test
	public void sendEmail(){
		OnRegistrationCompleteEvent event = new OnRegistrationCompleteEvent(user, "appURL", "randomToken");
		registrationListener.onApplicationEvent(event);
	}
}
