package repositories;

import java.net.UnknownHostException;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

import com.mongodb.Mongo;
import com.mongodb.MongoException;

@Configuration
@ComponentScan(basePackages={"repositories", "models"})
@EnableMongoRepositories(basePackageClasses = DownloadRepository.class)
public class DownloadRepositoryTestConfiguration{
	private static final String DATABASE_NAME = "dbnameTest";

    public @Bean Mongo mongo() throws UnknownHostException, MongoException {
            Mongo mongo = new Mongo("localhost");
            return mongo;
    }

    public @Bean MongoTemplate mongoTemplate() throws UnknownHostException, MongoException {
            MongoTemplate mongoTemplate = new MongoTemplate(mongo(), DATABASE_NAME);
            return mongoTemplate;
    }
}
