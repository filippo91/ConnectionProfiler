package com.example;

import static org.junit.Assert.*;

import org.joda.time.DateTime;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import models.Download;
import repositories.DownloadRepository;

@RunWith(SpringRunner.class)
@SpringBootTest(classes=com.example.TestMongodbForAiProjectApplication.class)
public class DownloadTest {
	@Autowired DownloadRepository repo;
	
	@Test
	public void testTimestampSupport(){
		Download source, retrieved;
		source = new Download();
		
		source.setTimestamp(DateTime.now().toDate());
		source = repo.save(source);
		String id = source.getId();

		System.out.println(source);
		retrieved = repo.findOne(id);
		assertEquals(source.getTimestamp(), retrieved.getTimestamp());
	}
}
