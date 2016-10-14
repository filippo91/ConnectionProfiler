package connectionProfiler;
import java.util.Collection;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;

import configurations.mvc.ConnectionProfilerAppInitializer;
import configurations.root.ConnectionProfilerAppConfig;
import models.BinSpeedDownload;
import services.DownloadService;
import services.PlotsService;
import services.PlotsService.View;

@WebAppConfiguration
@ContextConfiguration(classes=ConnectionProfilerAppConfig.class)
@RunWith(SpringJUnit4ClassRunner.class)
public class TestDownloadService {
	private static final int ONE_MBIT = 1000000;
	
	@Autowired PlotsService plotsService;
	
	@Test
	public void speedDownloadQuery(){
		Collection<BinSpeedDownload> list = plotsService.getBinSpeedDownloads(2016, 9, 5, View.months, ONE_MBIT/3);
		System.out.println(list);
	}
}
