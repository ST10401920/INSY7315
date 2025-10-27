package com.vcsd.nestify

import android.graphics.BitmapFactory
import android.util.Base64
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class PropertyAdapter(
    properties: MutableList<Property>,
    private val onItemClickListener: (String) -> Unit
) : RecyclerView.Adapter<PropertyAdapter.PropertyViewHolder>() {

    private var properties: MutableList<Property> = properties.toMutableList()
    private val allProperties = properties.toMutableList()
    private val priceRanges = listOf(5000, 6000, 7000, 8000, 9000, 10000)

    class PropertyViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val imageView: ImageView = view.findViewById(R.id.iv_property_image)
        val nameTextView: TextView = view.findViewById(R.id.tv_property_location)
        val priceTextView: TextView = view.findViewById(R.id.tv_property_price)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): PropertyViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.property_item, parent, false)
        return PropertyViewHolder(view)
    }

    override fun onBindViewHolder(holder: PropertyViewHolder, position: Int) {
        val property = properties[position]

        holder.nameTextView.text = property.name ?: "Unknown Location"
        holder.priceTextView.text = "R${property.price ?: 0}/ night"

        val rawBase64 = property.images?.firstOrNull()
        if (!rawBase64.isNullOrEmpty()) {
            var cleanBase64 = rawBase64.replace("\\s".toRegex(), "")
            if (cleanBase64.startsWith("data:image")) {
                val commaIndex = cleanBase64.indexOf(",")
                if (commaIndex != -1) cleanBase64 = cleanBase64.substring(commaIndex + 1)
            }
            try {
                val decodedBytes = Base64.decode(cleanBase64, Base64.DEFAULT)
                val bitmap = BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.size)
                if (bitmap != null) holder.imageView.setImageBitmap(bitmap)
                else holder.imageView.setImageResource(R.drawable.placeholder)
            } catch (e: IllegalArgumentException) {
                Log.e("PropertyAdapter", "Invalid Base64 for property ${property.id}", e)
                holder.imageView.setImageResource(R.drawable.placeholder)
            }
        } else {
            holder.imageView.setImageResource(R.drawable.placeholder)
        }

        holder.itemView.setOnClickListener { onItemClickListener(property.id) }
    }

    override fun getItemCount() = properties.size

    fun filterAndSearch(
        searchText: String? = null,
        selectedPrice: Int? = null,
        bedrooms: Int? = null,
        amenitiesFilter: List<String>? = null
    ) {
        properties = allProperties.filter { property ->
            val matchesSearch = searchText.isNullOrBlank() ||
                    property.name?.contains(searchText, ignoreCase = true) == true

            val matchesPrice = if (selectedPrice == null) {
                true
            } else {
                val index = priceRanges.indexOf(selectedPrice)
                when {
                    index == 0 -> (property.price ?: 0) <= selectedPrice
                    index == priceRanges.lastIndex -> (property.price ?: 0) >= selectedPrice
                    else -> {
                        val nextValue = priceRanges.getOrNull(index + 1) ?: selectedPrice
                        (property.price ?: 0) in selectedPrice until nextValue
                    }
                }
            }

            val matchesBedrooms = bedrooms == null || (property.bedrooms ?: 0) >= bedrooms

            val matchesAmenities = if (amenitiesFilter.isNullOrEmpty()) {
                true
            } else {
                val propertyAmenities = property.amenities?.map { it.lowercase() } ?: emptyList()
                amenitiesFilter.map { it.lowercase() }.any { it in propertyAmenities }
            }

            matchesSearch && matchesPrice && matchesBedrooms && matchesAmenities
        }.toMutableList()

        notifyDataSetChanged()
    }
}
