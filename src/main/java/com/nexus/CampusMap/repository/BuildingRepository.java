package com.nexus.CampusMap.repository;
package com.nexus.CampusMap.repository;

import com.nexus.CampusMap.entity.Building;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BuildingRepository extends JpaRepository<Building, Long> {

}