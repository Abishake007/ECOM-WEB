package com.telusko.ecom_proj.repo;

import com.telusko.ecom_proj.model.ERole;
import com.telusko.ecom_proj.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Integer> {
  Optional<Role> findByName(ERole name);
}
