package services;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

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
	@Autowired UserRepository userRepository;
	
	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		User user = userRepository.findByUsername(username);
		
		System.out.println(user);
		if(user == null){
			throw new UsernameNotFoundException(username);
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
		Set<String> roles = user.getRoles();
		
        List<GrantedAuthority> authorities = new ArrayList<GrantedAuthority>();
        
        for (String role : roles) {
            authorities.add(new SimpleGrantedAuthority(role));
        }
        
        return authorities;
	}
}
