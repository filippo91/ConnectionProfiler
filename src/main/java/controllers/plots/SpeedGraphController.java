package controllers.plots;

import java.util.Collection;

import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import models.AvgDaySpeedDownload;
import models.User;
import services.PlotsService;
import services.PlotsService.View;

@CrossOrigin
@RestController
public class SpeedGraphController {
	private static final Logger log = LoggerFactory.getLogger(SpeedGraphController.class);
	
	@Autowired PlotsService plotsService;
	
	/*
	 * @RequestMapping(method=GET) = @GetMapping
	 */
	@GetMapping("/speedGraph/{year}/{month}/{day}/{view}")
	public Collection<AvgDaySpeedDownload> getDownloadsSpeed(
			@PathVariable int year, 
			@PathVariable int month, 
			@PathVariable int day,
			@PathVariable View view,
			@AuthenticationPrincipal User user){

		DateTime d = new DateTime(year, month+1, day, 0, 0);
		
		//User user = userService.getCurrentUser();
		int uuid = user.getId();
		
		return plotsService.getAvgDayDownloadsSpeed(uuid, year, month, day, view);
	}
	
	@PreAuthorize("permitAll()")
	@GetMapping("/public/speedGraph/{year}/{month}/{day}/{view}")
	public Collection<AvgDaySpeedDownload> getPublicDownloadsSpeed(
			@PathVariable int year, 
			@PathVariable int month, 
			@PathVariable int day,
			@PathVariable View view){
		
		DateTime d = new DateTime(year, month+1, day, 0, 0);
		
		return plotsService.getAvgDayDownloadsSpeed(year, month, day, view);
	}
	
}
