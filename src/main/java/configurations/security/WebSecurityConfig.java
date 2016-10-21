package configurations.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;

import services.UserDetailsServiceImpl;

@Configuration
@EnableWebSecurity
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {
	@Autowired
    private UserDetailsServiceImpl customUserDetailsService;
	
	@Override
	@Autowired
	public void configure(AuthenticationManagerBuilder auth) throws Exception {
		auth
		.userDetailsService(customUserDetailsService)
		.passwordEncoder(new BCryptPasswordEncoder());
	
	}
	
	@Override
	protected void configure(HttpSecurity http) throws Exception {
		/*
		http
			.authorizeRequests()
			.anyRequest()
			.permitAll()
			.and()
			.csrf()
			.disable();
				*/
		http
		
			.authorizeRequests()
				.antMatchers(
						"/",
						"/img/**", "/css/**", "/js/**", "/fonts/**", "/partials/public/**", "/index.html",
						"/connection-profiler-websocket/**", 
						"/publics/**").permitAll()
				.anyRequest().authenticated()
				.and()
			.httpBasic()
				.and()
			.csrf()
				.disable();
	
				/*
			.csrf()
				.disable();
				/*.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
				.and()
			.httpBasic();
			*/
	}
}