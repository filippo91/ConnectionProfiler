package com.example;


import java.util.Date;

import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.SecurityProperties;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

/*
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.authority.AuthorityUtils;
import models.User;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
*/
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;

import controllers.DownloadController;
import models.Download;
import repositories.DownloadRepository;
//import repositories.UserRepository;
import services.MyDownloadService;

@SpringBootApplication
@EnableMongoRepositories(basePackageClasses=DownloadRepository.class)
@ComponentScan(basePackageClasses={DownloadController.class, MyDownloadService.class})
public class TestMongodbForAiProjectApplication implements CommandLineRunner{

	private static final Logger log = LoggerFactory.getLogger(TestMongodbForAiProjectApplication.class);
	
	@Autowired DownloadRepository downloadRepo;
	//@Autowired UserRepository userRepo;
	
	public static void main(String[] args) {
		log.info("start app");
		SpringApplication.run(TestMongodbForAiProjectApplication.class, args);
	}
	
	
	@Override
	public void run(String... args) throws Exception {
		/*ObjectMapper mapper = new ObjectMapper();
		List<Download> mock_download = null;
		try {
			mock_download = mapper.readValue(new File("mock_data.json"), new TypeReference<List<Download>>(){});
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		*/
		/*
		User user = new User("user", "password", true, true, true, true, AuthorityUtils.commaSeparatedStringToAuthorityList("USER"));
		userRepo.save(user);
		*/
		DateTime date = DateTime.now();
		downloadRepo.deleteAll();
		for(int i = 0; i < 100; i++){
			Download d = new Download();
			d.setUuid(i%25);
			d.setTimestamp(date.plusDays(i).toDate());
			d.setDownload_speed(new Long(1000+(i%3)*200));
			d.setAsnum(i%5);
			d = downloadRepo.save(d);
		}		
	}
	
	@Configuration
	public class WebConfig extends WebMvcConfigurerAdapter{
		@Override
		public void addResourceHandlers(ResourceHandlerRegistry registry){
			registry.addResourceHandler("/**").addResourceLocations("classpath:/static/");
		}
	}
/*
	@Configuration
	@Order(SecurityProperties.ACCESS_OVERRIDE_ORDER)
	protected static class SecurityConfiguration extends WebSecurityConfigurerAdapter {
	    @Override
	    protected void configure(HttpSecurity http) throws Exception {
	      http
	        .httpBasic()
	        .and()
	        .authorizeRequests()
	        .antMatchers("/index.html", "/css/**", "/js/**", "/partials/public/**", "/logout").permitAll()
	        .anyRequest().authenticated()
	        .and()
	        .csrf()
	        .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse());;
	    }
	    
	    @Autowired
	    public void globalUserDetails(AuthenticationManagerBuilder auth) throws Exception {
	      auth.inMemoryAuthentication()
	        .withUser("user").password("password").roles("USER");
	    }
	  }
	*/
}
