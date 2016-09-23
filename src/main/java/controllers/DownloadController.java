package controllers;


import java.util.Collection;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import models.AvgDaySpeedDownload;
import models.BinLatencyDownload;
import models.BinSpeedDownload;
import models.Download;
import models.FrequencyAccess;
import models.SizeDownload;
import services.DownloadService;
import services.DownloadService.View;

@CrossOrigin
@RestController
public class DownloadController {
	@Autowired private DownloadService downloadService;
	
	@RequestMapping("/greeting")
	public Download greeting(){
		System.out.println("hello");
		return new Download();
	}
	
	/*
	 * @RequestMapping(method=GET) = @GetMapping
	 */
	@GetMapping("/speedGraph/{year}/{month}/{day}/{view}")
	public Collection<AvgDaySpeedDownload> getDownloadsSpeed(
			@PathVariable int year, 
			@PathVariable int month, 
			@PathVariable int day,
			@PathVariable View view){
		//get uuid from spring security
		int uuid = 0;
		
		return downloadService.getAvgDayDownloadsSpeed(uuid, year, month, day, view);
	}
	
	@GetMapping("/speedGraphPublic/{year}/{month}/{day}/{view}")
	public Collection<AvgDaySpeedDownload> getDownloadsSpeedPublic(
			@PathVariable int year, 
			@PathVariable int month, 
			@PathVariable int day,
			@PathVariable View view){
		//get uuid from spring security
		
		return downloadService.getAvgDayDownloadsSpeed(year, month, day, view);
	}
	
	@GetMapping("/speedTable/{page}/{size}")
	public Collection<Download> getDownloadsSpeedByWeek(
			@PathVariable int page, 
			@PathVariable int size){
		//get uuid from spring security
		int uuid = 0;
		
		return downloadService.getDownloadsSpeed(uuid, page, size);
	}
	
	@GetMapping("/speedHistogram/{year}/{month}/{day}/{view}")
	public Collection<BinSpeedDownload> getBinSpeedDownloads(
			@PathVariable int year, 
			@PathVariable int month, 
			@PathVariable int day,
			@PathVariable View view){
		int uuid = 0;
		
		return downloadService.getBinSpeedDownloads(uuid, year, month, day, view);
	}
	
	@GetMapping("/latencyHistogram/{year}/{month}/{day}/{view}/{bin_width}")
	public Collection<BinLatencyDownload> getBinLatencyDownloads(
			@PathVariable int year, 
			@PathVariable int month, 
			@PathVariable int day,
			@PathVariable View view,
			@PathVariable int bin_width){
		int uuid = 0;
		
		return downloadService.getBinLatencyDownloads(uuid, year, month, day, view, bin_width);
	}
	
	@GetMapping("/latencyHistogramPublic/{year}/{month}/{day}/{view}/{bin_width}")
	public Collection<BinLatencyDownload> getBinLatencyDownloadsPublic(
			@PathVariable int year, 
			@PathVariable int month, 
			@PathVariable int day,
			@PathVariable View view,
			@PathVariable int bin_width){
		
		return downloadService.getBinLatencyDownloads(year, month, day, view, bin_width);
	}
	
	@GetMapping("/pieAccesses/{year}/{month}/{day}/{view}")
	public Collection<FrequencyAccess> getDomainFrequencyAccess(
			@PathVariable int year, 
			@PathVariable int month, 
			@PathVariable int day,
			@PathVariable View view){
		int uuid = 0;
		
		return downloadService.getDomainFrequencyAccess(uuid, year, month, day, view);
	}
	
	@GetMapping("/pieSize/{year}/{month}/{day}/{view}")
	public Collection<SizeDownload> getDomainSizeDownload(
			@PathVariable int year, 
			@PathVariable int month, 
			@PathVariable int day,
			@PathVariable View view){
		int uuid = 0;
		
		return downloadService.getDomainSizeDownload(uuid, year, month, day, view);
	}
	
	@PostMapping(path="/download")
	@ResponseStatus(value=HttpStatus.CREATED)
	public Download saveDownload(@RequestBody Download download)
	{
		System.out.println(download);
		Download download_created = downloadService.saveDownload(download);
		return download_created;
	}
}
