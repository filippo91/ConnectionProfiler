package services;

import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;
import org.springframework.context.ApplicationEventPublisher;

import models.User;
import models.VerificationToken;
import repositories.UserRepository;

@RunWith(MockitoJUnitRunner.class)
public class UserServiceTest {
	
	@Mock UserRepository userRepository;
	@Mock TokenServiceImpl tokenService;
	@Mock ApplicationEventPublisher eventPublisher;
	
	@InjectMocks
	private UserServiceImpl userService;	
	
	private User user = new User("Pippo", "pippo@gmail.com", "password", 1);
	
	@Test
	public void shouldCallSaveOnce_whenANewUserIsSaved(){		
		
		when(userRepository.save(user)).thenReturn(user);
		
		userService.register(user, new VerificationToken());
		
		verify(userRepository, times(1)).save(user);
	}
}
