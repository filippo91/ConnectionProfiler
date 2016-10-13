package services;

import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Date;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;
import org.springframework.context.ApplicationEventPublisher;

import models.User;
import repositories.UserRepository;

@RunWith(MockitoJUnitRunner.class)
public class SimpleUserServiceTest {
	
	@Mock UserRepository userRepository;
	@Mock SimpleTokenService tokenService;
	@Mock ApplicationEventPublisher eventPublisher;
	
	@InjectMocks
	private SimpleUserService userService;	
	
	private Date registrationDate = new Date(10);
	private User user = new User("Pippo", "pippo@gmail.com", "password", 1);
	
	@Test
	public void shouldCallSaveOnce_whenANewUserIsSaved(){		
		
		when(userRepository.save(user)).thenReturn(user);
		
		userService.register(user, registrationDate);
		
		verify(userRepository, times(1)).save(user);
	}
}
