package connectionProfiler;
import java.io.IOException;
import java.util.Properties;

import org.apache.velocity.app.VelocityEngine;
import org.apache.velocity.exception.VelocityException;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.ui.velocity.VelocityEngineFactory;

@Configuration
@ComponentScan(basePackages={"listeners"})
public class TestRegistrationListenerConfiguration {
	 @Bean
	    public JavaMailSender javaMailService() {
	        JavaMailSenderImpl javaMailSender = new JavaMailSenderImpl();
	        String host = "localhost";
			javaMailSender.setHost(host);
	        int port = 25; //smtp server port 
			javaMailSender.setPort(port);
	        
	        return javaMailSender;
	    }
	  @Bean
	    public VelocityEngine velocityEngine() throws VelocityException, IOException{
	        VelocityEngineFactory factory = new VelocityEngineFactory();
	        Properties props = new Properties();
	        props.put("resource.loader", "class");
	        props.put("class.resource.loader.class", "org.apache.velocity.runtime.resource.loader.ClasspathResourceLoader");
	        factory.setVelocityProperties(props);
	        return factory.createVelocityEngine();      
	    }
}
