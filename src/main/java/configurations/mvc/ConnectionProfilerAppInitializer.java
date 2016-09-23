package configurations.mvc;

import org.springframework.web.servlet.support.AbstractAnnotationConfigDispatcherServletInitializer;

import configurations.root.ConnectionProfilerAppConfig;;

public class ConnectionProfilerAppInitializer extends AbstractAnnotationConfigDispatcherServletInitializer{

	@Override
	protected Class<?>[] getRootConfigClasses() {
		return new Class[] {ConnectionProfilerAppConfig.class};
	}

	@Override
	protected Class<?>[] getServletConfigClasses() {
		return new Class[] {WebConfig.class};
	}

	@Override
	protected String[] getServletMappings() {
		return new String[] {"/*"};
	}

}
