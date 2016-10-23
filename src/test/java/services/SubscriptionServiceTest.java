package services;

import static org.junit.Assert.assertEquals;
import static org.mockito.Matchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Matchers;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;

import models.Provider;
import models.Subscription;
import models.User;
import repositories.SubscriptionRepository;

@RunWith(MockitoJUnitRunner.class)
public class SubscriptionServiceTest {
	@Mock UserService userService;
	@Mock ProviderService providerService;
	@Mock SubscriptionRepository subscriptionRepository;
	
	@InjectMocks SubscriptionService subscriptionService = new SubscriptionServiceImpl();
	
	@Test
	public void addSubscription_shouldUpdateUserAndProvider(){
		User user = new User();
		Provider provider = new Provider();		
		Subscription subscriptionReq = new Subscription();
		subscriptionReq.setUser(user);
		subscriptionReq.setProvider(provider);
		
		Subscription subscriptionSaved = subscriptionReq;
		subscriptionSaved.setId(1);
		
		when(subscriptionRepository.save(subscriptionReq)).thenReturn(subscriptionSaved);
		
		subscriptionService.addSubscription(subscriptionReq, user, provider);
		
		verify(userService, times(1)).addSubscription(user, subscriptionSaved);
		verify(providerService, times(1)).addSubscription(provider, subscriptionSaved);
	}
	
	@Test
	public void addSubscription_shouldSetUserAndProvider(){
		User user = new User();
		Provider provider = new Provider();		
		Subscription subscriptionReq = new Subscription();
		subscriptionReq.setUser(user);
		subscriptionReq.setProvider(provider);
		
		Subscription subscriptionSaved = subscriptionReq;
		subscriptionSaved.setId(1);
		
		when(subscriptionRepository.save(subscriptionReq)).thenReturn(subscriptionSaved);
		
		subscriptionService.addSubscription(subscriptionReq, user, provider);
		
		assertEquals(subscriptionSaved.getUser(), user);
		assertEquals(subscriptionSaved.getProvider(), provider);
	}
}
