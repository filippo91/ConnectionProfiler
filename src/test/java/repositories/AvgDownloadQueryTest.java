package repositories;

import static org.junit.Assert.assertTrue;

import java.util.Collection;
import java.util.List;

import org.joda.time.DateTime;
import org.joda.time.DateTimeConstants;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import models.AvgDaySpeedDownload;
import models.Download;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = DownloadRepositoryTestConfiguration.class)
public class AvgDownloadQueryTest {
	
	@Autowired
	DownloadRepository downloadRepository;
	
	@Test
	public void simpleTest(){
		downloadRepository.deleteAll();
		
		DateTime start = new DateTime(0).withDayOfWeek(DateTimeConstants.MONDAY).plusWeeks(1).plusHours(2);
		System.out.println(start);
		
		Download d = new Download();
		d.setTimestamp(start.toDate());
		d.setUuid(2);
		d.setAsname("fastweb");
		d.setAsnum(1);
		d.setDownload_speed(10L);
		d.setSize(1L);
		d.setDuration(1L);
		d.setResource_type("img/jpg");
		d.setServer_domain("google.com");
		d.setClient_address("31.10.5.7");
		
		Download d2 = new Download();
		d2.setTimestamp(start.plusHours(1).toDate());
		d2.setUuid(2);
		d2.setAsname("fastweb");
		d2.setAsnum(1);
		d2.setDownload_speed(30L);
		d2.setSize(1L);
		d2.setDuration(1L);
		d2.setResource_type("img/jpg");
		d2.setServer_domain("google.com");
		d2.setClient_address("31.10.5.7");
		
		Download d3 = new Download();
		d3.setTimestamp(start.plusHours(2).toDate());
		d3.setUuid(2);
		d3.setAsname("fastweb");
		d3.setAsnum(1);
		d3.setDownload_speed(50L);
		d3.setSize(1L);
		d3.setDuration(1L);
		d3.setResource_type("img/jpg");
		d3.setServer_domain("google.com");
		d3.setClient_address("31.10.5.7");
		
		downloadRepository.save(d);
		downloadRepository.save(d2);
		downloadRepository.save(d3);
		
		System.out.println(downloadRepository.findAll());
		
		Collection<AvgDaySpeedDownload> result = downloadRepository.getAvgDayDownloadsSpeed(start, start.plusWeeks(1));
		List<AvgDaySpeedDownload> list = (List<AvgDaySpeedDownload>)result;
		System.out.println(result);
		assertTrue(result.size() == 1);
		assertTrue(list.get(0).getSpeed() == 30);
		
		System.out.println(result);
	}
	
}
