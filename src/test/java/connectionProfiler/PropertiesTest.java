package connectionProfiler;

import static org.junit.Assert.assertEquals;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.Environment;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;

import configurations.root.ConnectionProfilerAppConfig;

@WebAppConfiguration
@ContextConfiguration(classes=ConnectionProfilerAppConfig.class)
@RunWith(SpringJUnit4ClassRunner.class)
public class PropertiesTest {
    @Autowired Environment env;
    @Autowired ConfigurableApplicationContext applicationContext;
    
    @Value( "${connectionProfiler.creators}" )
    private String creators;
    @Value("${spring.application.name}")
	private String appName;
	@Test
	public void  givenContextIsInitialized_thenNoException(){
		String creatorsEnvironment = env.getProperty("connectionProfiler.creators");
        assertEquals(creators, creatorsEnvironment);
        System.out.println(appName);
	}
}
