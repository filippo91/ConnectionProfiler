package services;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import models.User;
import repositories.UserRepository;

@Service
public class UserDetailsServiceImpl implements UserDetailsService{
	private static final Logger log = LoggerFactory.getLogger(UserDetailsServiceImpl.class);
	
	@Autowired UserRepository userRepository;
	
	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		User user = userRepository.findByUsername(username);
		
		log.info("Load user from user repository: " + user);
		
		if(user == null){
			log.error("User "+ username + " not found");
			throw new UsernameNotFoundException(username);
		}
		
		
		if(user.isEnabled()){
			log.info("Abilitato ");
		}else{
			log.info("Non Abilitato ");
		}

		org.springframework.security.core.userdetails.User userDetails = null;
		
		userDetails = new org.springframework.security.core.userdetails.User(
				user.getUsername(),
				user.getPassword(),
				user.isEnabled(),
				user.isAccountNonExpired(),
				user.isCredentialsNonExpired(),
				user.isAccountNonLocked(),
				getAuthorities(user)
				);
		
		return userDetails;
	}

	private List<GrantedAuthority> getAuthorities(User user) {
		String role = user.getRole();
		
        List<GrantedAuthority> authorities = new ArrayList<GrantedAuthority>();
        
            authorities.add(new SimpleGrantedAuthority(role));
        
        return authorities;
	}

}
