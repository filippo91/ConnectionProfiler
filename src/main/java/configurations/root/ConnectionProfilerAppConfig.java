package configurations.root;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

import com.mongodb.Mongo;
import com.mongodb.MongoClient;

@Configuration
@ComponentScan(basePackages={"services", "configurations.security"})
@EnableMongoRepositories(basePackages={"repositories"})
public class ConnectionProfilerAppConfig {
	//RootContext
	public @Bean Mongo mongo() throws Exception {
		return new MongoClient("localhost");
	}
	
	public @Bean MongoTemplate mongoTemplate() throws Exception{
		return new MongoTemplate(mongo(), "dbname");
	}
}
