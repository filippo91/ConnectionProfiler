package services;

import static org.junit.Assert.*;
import static org.mockito.Matchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Date;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;

import models.User;
import models.VerificationToken;
import repositories.VerificationTokenRepository;

@RunWith(MockitoJUnitRunner.class)
public class SimpleTokenServiceTest {
	@Mock VerificationTokenRepository tokenRepository;
	
	@InjectMocks
	private SimpleTokenService tokenService;
	
	Date creationDate = new Date(10);
	Date expirationDate = new Date(10+SimpleTokenService.VERIFICATION_TOKEN_DURATION);
	Date verificationDateValid = new Date(10+SimpleTokenService.VERIFICATION_TOKEN_DURATION-1);
	Date verificationDateTooLate = new Date(10+SimpleTokenService.VERIFICATION_TOKEN_DURATION+1);
	VerificationToken token = new VerificationToken("token", new User(), creationDate, expirationDate);
	
	@Test
	public void itShouldValidBeforeTokenExpirationDate(){
		
		when(tokenRepository.findByToken("token")).thenReturn(token);
		
		assertTrue(tokenService.isValid("token", verificationDateValid));
		
	}
	
	@Test
	public void isValid_shouldReturnFalse_whenNoToken(){
		assertFalse(tokenService.isValid("token", verificationDateTooLate));
	}
	
	@Test
	public void isValid_shouldReturnFalse_whenItIsExpired(){
		when(tokenRepository.findByToken("token")).thenReturn(token);
		assertFalse(tokenService.isValid("token", verificationDateTooLate));
	}
	
	@Test
	public void create_shouldCreateANewToken(){	
		User user = new User();
		
		String newToken = tokenService.createToken(user, creationDate);
		
		assertNotNull(newToken);
		
		verify(tokenRepository, times(1)).save(any(VerificationToken.class));
		
	}
	
	@Test
	public void findByToken_shouldReturnNotNull_whenTokenExist(){	
		when(tokenRepository.findByToken("token")).thenReturn(token);
		
		VerificationToken tokenReturned = tokenService.findByToken("token");
		
		verify(tokenRepository, times(1)).findByToken("token");
		
		assertNotNull(tokenReturned);
		assertEquals(token, tokenReturned);
	}
	
	@Test
	public void findByToken_shouldReturnNull_whenTokenNotExist(){		
		VerificationToken tokenReturned = tokenService.findByToken("token");
		
		verify(tokenRepository, times(1)).findByToken("token");

		assertNull(tokenReturned);
	}
	
}
