package repositories;

import static org.junit.Assert.*;

import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.joda.time.DateTime;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import models.AvgDaySpeedDownload;
import models.Download;
import models.SizeDownload;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = DownloadRepositoryTestConfiguration.class)
public class DownloadRepositoryTest {
	@Autowired DownloadRepository downloadRepository;

	@Test
	public void getSizeDownloadsByDomain_ReturnsZeroRecords_whenNoRecordInTheRange() {
		downloadRepository.deleteAll();
		
		DateTime start = new DateTime(0);
		DateTime end = start.plusDays(7);
		
		Download d1 = new Download();
		d1.setTimestamp(start.toDate());
		d1.setUuid(0);
		downloadRepository.save(d1);
		
		Collection<SizeDownload> d = downloadRepository.getSizeDownloadsByDomain(0, end.toDate(), end.plusDays(7).toDate());
		
		assertTrue(d.size() == 0);
	}
	
	@Test
	public void getSizeDownloadsByDomain_ZeroRecords_IfNoRecordForTheUser() {
		downloadRepository.deleteAll();
		
		DateTime start = new DateTime(0);
		DateTime end = start.plusDays(7);
		
		int download_uuid = 1;
		int query_uuid = 0;
		
		Download d1 = new Download();
		d1.setUuid(download_uuid);
		d1.setTimestamp(start.toDate());
		
		downloadRepository.save(d1);
		
		Collection<SizeDownload> d = downloadRepository.getSizeDownloadsByDomain(query_uuid, start.toDate(), end.toDate());
		
		assertTrue(d.size() == 0);
	}
	
	@Test
	public void getSizeDownloadsByDomain_OneRecord_IfOneRecordInTheRange() {
		downloadRepository.deleteAll();
		
		DateTime start = new DateTime(0);
		DateTime end = start.plusDays(7);
		
		int uuid = 0;
		
		Download d1 = new Download();
		d1.setUuid(uuid);
		
		d1.setServer_domain("google.com");
		d1.setTimestamp(start.toDate());
		
		downloadRepository.save(d1);
		
		Collection<SizeDownload> d = downloadRepository.getSizeDownloadsByDomain(uuid, start.toDate(), end.toDate());
		
		assertTrue(d.size() == 1);
	}
	
	@Test
	public void getSizeDownloadsByDomain_OneRecordPerDomain() {
		downloadRepository.deleteAll();
		
		DateTime start = new DateTime(0);
		DateTime end = start.plusDays(7);
		
		int uuid = 0;
		
		Collection<Download> downloads = new HashSet<Download>(); 
		
		Download d1 = new Download();
		d1.setUuid(uuid);
		d1.setServer_domain("google.com");
		d1.setTimestamp(start.toDate());
		downloads.add(d1);
		
		Download d2 = new Download();
		d2.setUuid(uuid);
		d2.setServer_domain("cisco.com");
		d2.setTimestamp(start.toDate());
		downloads.add(d2);
		
		downloadRepository.save(downloads);
		
		Collection<SizeDownload> result = downloadRepository.getSizeDownloadsByDomain(uuid, start.toDate(), end.toDate());
		
		assertTrue(result.size() == downloads.size());
	}
	
	@Test
	public void getAvgDayDownloadsSpeed() {
		downloadRepository.deleteAll();
		
		DateTime start = new DateTime(0);
		DateTime end = start.plusDays(7);
		
		Download d1 = new Download();
		d1.setUuid(0);
		d1.setServer_domain("google.com");
		d1.setTimestamp(start.plusDays(1).toDate());
		d1.setSize(1L);
		d1.setAsname("fastweb");
		d1.setAsnum(1);
		d1.setDownload_speed(1L);
		
		downloadRepository.save(d1);
		
		Download d2 = new Download();
		d2.setUuid(0);
		d2.setServer_domain("google.com");
		d2.setTimestamp(start.plusDays(1).toDate());
		d2.setSize(1L);
		d2.setAsname("fastweb");
		d2.setAsnum(1);
		d2.setDownload_speed(4L);
		
		downloadRepository.save(d2);
		
		Download d3 = new Download();
		d3.setUuid(1);
		d3.setServer_domain("google.com");
		d3.setTimestamp(start.plusDays(1).toDate());
		d3.setSize(1L);
		d3.setAsname("vodafone");
		d3.setAsnum(2);
		d3.setDownload_speed(4L);
		
		downloadRepository.save(d3);
		
		Collection<AvgDaySpeedDownload> daySpeed = downloadRepository.getAvgDayDownloadsSpeed(0, start.toDate(), end.toDate());
		
		System.out.println(daySpeed);
		
		assertTrue(daySpeed.size() == 1);
		long expectedAvgSpeed = (d1.getDownload_speed() + d2.getDownload_speed()) / 2;
		long avgSpeed = daySpeed.iterator().next().getSpeed();
		assertEquals(expectedAvgSpeed, avgSpeed);
	}
	
}
